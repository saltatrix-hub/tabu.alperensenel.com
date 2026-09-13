import { env } from 'cloudflare:workers';
import { cards, pickCard } from '../../../lib/cards';

export const runtime = 'edge';

type Team = 'A' | 'B';
type Settings = { playerLimit:number; duration:number; passLimit:number; targetScore:number; category:string };
type GameState = { activeTeam:Team; currentPlayerId:string; endsAt:number; passesLeft:number; cardIndex:number; used:number[]; teamCursor:Record<Team, number> };
type RoomRow = { id:string; code:string; host_token:string; status:string; settings:string; scores:string; game_state:string | null; created_at:number; updated_at:number };
type PlayerRow = { id:string; room_id:string; name:string; team:Team; seat:number; token:string; joined_at:number };

const json = (data:unknown, status = 200) => Response.json(data, { status, headers:{ 'Cache-Control':'no-store' } });
const fail = (message:string, status = 400) => json({ error:message }, status);
const id = () => crypto.randomUUID();
const token = () => `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll('-', '');
const roomCode = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (n) => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n % 32]).join('');

async function ensureSchema() {
  const db = env.DB;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS rooms (id TEXT PRIMARY KEY NOT NULL, code TEXT NOT NULL, host_token TEXT NOT NULL, status TEXT DEFAULT 'lobby' NOT NULL, settings TEXT NOT NULL, scores TEXT DEFAULT '{"A":0,"B":0}' NOT NULL, game_state TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`),
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_code ON rooms (code)'),
    db.prepare('CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY NOT NULL, room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE, name TEXT NOT NULL, team TEXT NOT NULL, seat INTEGER NOT NULL, token TEXT NOT NULL, joined_at INTEGER NOT NULL)'),
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_players_token ON players (token)'),
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_players_room_name ON players (room_id, name)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_players_room_team ON players (room_id, team, seat)'),
  ]);
}

async function loadRoom(code:string) {
  return env.DB.prepare('SELECT * FROM rooms WHERE code = ?').bind(code).first<RoomRow>();
}

async function loadPlayers(roomId:string) {
  const result = await env.DB.prepare('SELECT * FROM players WHERE room_id = ? ORDER BY seat ASC').bind(roomId).all<PlayerRow>();
  return result.results;
}

function view(room:RoomRow, players:PlayerRow[], viewerToken:string) {
  const settings = JSON.parse(room.settings) as Settings;
  const scores = JSON.parse(room.scores) as Record<Team, number>;
  const game = room.game_state ? JSON.parse(room.game_state) as GameState : null;
  const viewer = players.find((player) => player.token === viewerToken);
  const current = game ? players.find((player) => player.id === game.currentPlayerId) : null;
  const canSeeCard = !!(game && viewer && (viewer.id === game.currentPlayerId || viewer.team !== game.activeTeam));
  return {
    code:room.code, status:room.status, settings, scores,
    players:players.map(({ id, name, team, seat }) => ({ id, name, team, seat })),
    me:viewer ? { id:viewer.id, name:viewer.name, team:viewer.team, isHost:viewer.token === room.host_token } : null,
    game:game ? {
      activeTeam:game.activeTeam, currentPlayerId:game.currentPlayerId, currentPlayerName:current?.name ?? 'Oyuncu',
      endsAt:game.endsAt, passesLeft:game.passesLeft,
      card:canSeeCard ? cards[game.cardIndex] : null,
      cardVisible:canSeeCard,
    } : null,
  };
}

async function saveGame(room:RoomRow, scores:Record<Team, number>, game:GameState, status = room.status) {
  await env.DB.prepare('UPDATE rooms SET scores = ?, game_state = ?, status = ?, updated_at = ? WHERE id = ?')
    .bind(JSON.stringify(scores), JSON.stringify(game), status, Date.now(), room.id).run();
}

function nextCard(settings:Settings, game:GameState) {
  const selected = pickCard(settings.category, game.used);
  game.cardIndex = selected.index;
  game.used = [...game.used, selected.index].slice(-Math.max(12, Math.floor(cards.length * .7)));
}

async function endTurn(room:RoomRow, players:PlayerRow[], settings:Settings, scores:Record<Team, number>, game:GameState) {
  const nextTeam:Team = game.activeTeam === 'A' ? 'B' : 'A';
  const teamPlayers = players.filter((player) => player.team === nextTeam);
  if (!teamPlayers.length) return;
  const cursor = game.teamCursor[nextTeam] % teamPlayers.length;
  game.activeTeam = nextTeam;
  game.currentPlayerId = teamPlayers[cursor].id;
  game.teamCursor[nextTeam] = cursor + 1;
  game.endsAt = Date.now() + settings.duration * 1000;
  game.passesLeft = settings.passLimit;
  nextCard(settings, game);
  await saveGame(room, scores, game);
}

async function handleGet(request:Request) {
  await ensureSchema();
  const url = new URL(request.url);
  const code = (url.searchParams.get('code') ?? '').trim().toUpperCase();
  const viewerToken = url.searchParams.get('token') ?? '';
  const room = await loadRoom(code);
  if (!room) return fail('Oda bulunamadı.', 404);
  const players = await loadPlayers(room.id);
  return json(view(room, players, viewerToken));
}

async function handlePost(request:Request) {
  await ensureSchema();
  const body = await request.json() as Record<string, unknown>;
  const action = String(body.action ?? '');

  if (action === 'create') {
    const name = String(body.name ?? '').trim().slice(0, 24);
    if (name.length < 2) return fail('İsim en az 2 karakter olmalı.');
    const settings:Settings = {
      playerLimit:Math.min(10, Math.max(2, Number(body.playerLimit) || 4)),
      duration:[30,45,60,90].includes(Number(body.duration)) ? Number(body.duration) : 60,
      passLimit:Math.min(5, Math.max(0, Number(body.passLimit) || 0)),
      targetScore:[10,15,20,30].includes(Number(body.targetScore)) ? Number(body.targetScore) : 20,
      category:String(body.category ?? 'Genel'),
    };
    const now = Date.now(), newRoomId = id(), playerId = id(), playerToken = token(), code = roomCode();
    await env.DB.batch([
      env.DB.prepare('INSERT INTO rooms (id, code, host_token, status, settings, scores, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(newRoomId, code, playerToken, 'lobby', JSON.stringify(settings), '{"A":0,"B":0}', now, now),
      env.DB.prepare('INSERT INTO players (id, room_id, name, team, seat, token, joined_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(playerId, newRoomId, name, 'A', 0, playerToken, now),
    ]);
    return json({ code, token:playerToken }, 201);
  }

  const code = String(body.code ?? '').trim().toUpperCase();
  const room = await loadRoom(code);
  if (!room) return fail('Oda bulunamadı.', 404);
  let players = await loadPlayers(room.id);

  if (action === 'join') {
    if (room.status !== 'lobby') return fail('Bu oyun başlamış.');
    const settings = JSON.parse(room.settings) as Settings;
    if (players.length >= settings.playerLimit) return fail('Oda dolu.');
    const name = String(body.name ?? '').trim().slice(0, 24);
    if (name.length < 2) return fail('İsim en az 2 karakter olmalı.');
    if (players.some((player) => player.name.toLocaleLowerCase('tr') === name.toLocaleLowerCase('tr'))) return fail('Bu isim odada kullanılıyor.');
    const playerToken = token();
    const team:Team = players.filter((p) => p.team === 'A').length <= players.filter((p) => p.team === 'B').length ? 'A' : 'B';
    await env.DB.prepare('INSERT INTO players (id, room_id, name, team, seat, token, joined_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id(), room.id, name, team, players.length, playerToken, Date.now()).run();
    return json({ code, token:playerToken }, 201);
  }

  const viewerToken = String(body.token ?? '');
  const actor = players.find((player) => player.token === viewerToken);
  if (!actor) return fail('Oyuncu oturumu geçersiz.', 401);

  if (action === 'team') {
    if (room.status !== 'lobby') return fail('Takım yalnızca lobide değiştirilebilir.');
    const team:Team = body.team === 'B' ? 'B' : 'A';
    await env.DB.prepare('UPDATE players SET team = ? WHERE id = ?').bind(team, actor.id).run();
  } else if (action === 'start') {
    if (viewerToken !== room.host_token) return fail('Oyunu yalnızca kurucu başlatabilir.', 403);
    const a = players.filter((player) => player.team === 'A'), b = players.filter((player) => player.team === 'B');
    if (!a.length || !b.length) return fail('Her takımda en az bir oyuncu olmalı.');
    if (players.length < 2) return fail('En az iki oyuncu gerekli.');
    const settings = JSON.parse(room.settings) as Settings;
    const selected = pickCard(settings.category);
    const game:GameState = { activeTeam:'A', currentPlayerId:a[0].id, endsAt:Date.now() + settings.duration * 1000, passesLeft:settings.passLimit, cardIndex:selected.index, used:[selected.index], teamCursor:{ A:1, B:0 } };
    await saveGame(room, { A:0, B:0 }, game, 'playing');
  } else if (action === 'correct' || action === 'taboo' || action === 'pass' || action === 'end_turn') {
    if (room.status !== 'playing' || !room.game_state) return fail('Oyun aktif değil.');
    const settings = JSON.parse(room.settings) as Settings;
    const scores = JSON.parse(room.scores) as Record<Team, number>;
    const game = JSON.parse(room.game_state) as GameState;
    const isNarrator = actor.id === game.currentPlayerId;
    const isOpponent = actor.team !== game.activeTeam;
    if (action === 'correct') {
      if (!isNarrator) return fail('Doğru cevabı yalnızca anlatıcı işaretleyebilir.', 403);
      scores[game.activeTeam] += 1;
      nextCard(settings, game);
    } else if (action === 'taboo') {
      if (!isOpponent) return fail('Tabu kararını rakip takım verir.', 403);
      scores[game.activeTeam] -= 1;
      nextCard(settings, game);
    } else if (action === 'pass') {
      if (!isNarrator) return fail('Yalnızca anlatıcı pas geçebilir.', 403);
      if (game.passesLeft <= 0) return fail('Pas hakkı kalmadı.');
      game.passesLeft -= 1;
      nextCard(settings, game);
    } else {
      if (Date.now() < game.endsAt && !isNarrator && viewerToken !== room.host_token) return fail('Tur henüz bitmedi.', 403);
      await endTurn(room, players, settings, scores, game);
      const refreshed = await loadRoom(code);
      return json(view(refreshed!, players, viewerToken));
    }
    const finished = scores.A >= settings.targetScore || scores.B >= settings.targetScore;
    await saveGame(room, scores, game, finished ? 'finished' : 'playing');
  } else if (action === 'restart') {
    if (viewerToken !== room.host_token) return fail('Yalnızca kurucu yeniden başlatabilir.', 403);
    await env.DB.prepare("UPDATE rooms SET status = 'lobby', scores = ?, game_state = NULL, updated_at = ? WHERE id = ?").bind('{"A":0,"B":0}', Date.now(), room.id).run();
  } else return fail('Geçersiz işlem.');

  const refreshed = await loadRoom(code);
  players = await loadPlayers(room.id);
  return json(view(refreshed!, players, viewerToken));
}

const allowedOrigins = new Set([
  'https://tabu.alperensenel.com',
  'https://saltatrix-hub.github.io',
  'http://localhost:4173',
]);

function withCors(response:Response, request:Request) {
  const origin = request.headers.get('Origin');
  const headers = new Headers(response.headers);
  if (origin && allowedOrigins.has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return new Response(response.body, { status:response.status, statusText:response.statusText, headers });
}

export async function GET(request:Request) { return withCors(await handleGet(request), request); }
export async function POST(request:Request) { return withCors(await handlePost(request), request); }
export function OPTIONS(request:Request) { return withCors(new Response(null, { status:204 }), request); }
