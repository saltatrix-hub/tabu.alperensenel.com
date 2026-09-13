'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

type Team = 'A' | 'B';
type Player = { id:string; name:string; team:Team; seat:number };
type Room = {
  code:string; status:'lobby'|'playing'|'finished';
  settings:{ playerLimit:number; duration:number; passLimit:number; targetScore:number; category:string };
  scores:Record<Team, number>; players:Player[];
  me:{ id:string; name:string; team:Team; isHost:boolean } | null;
  game:null | { activeTeam:Team; currentPlayerId:string; currentPlayerName:string; endsAt:number; passesLeft:number; card:null | { word:string; forbidden:string[]; category:string }; cardVisible:boolean };
};

const categories = ['Genel','Günlük Hayat','Yemek','Spor','Teknoloji','Genel Kültür','Sanat'];
const API_ORIGIN = typeof window !== 'undefined' && ['tabu.alperensenel.com', 'saltatrix-hub.github.io'].includes(window.location.hostname)
  ? 'https://tabu-alperensenel.saltatrix.chatgpt.site'
  : '';

async function api(payload:Record<string, unknown>) {
  const response = await fetch(`${API_ORIGIN}/api/game`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Bir şeyler ters gitti.');
  return data;
}

export default function Home() {
  const [screen, setScreen] = useState<'home'|'create'|'join'|'room'>('home');
  const [roomCode, setRoomCode] = useState('');
  const [token, setToken] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchRoom = useCallback(async (code = roomCode, auth = token) => {
    if (!code || !auth) return;
    const response = await fetch(`${API_ORIGIN}/api/game?code=${encodeURIComponent(code)}&token=${encodeURIComponent(auth)}`, { cache:'no-store' });
    if (!response.ok) return;
    setRoom(await response.json());
  }, [roomCode, token]);

  useEffect(() => {
    const saved = localStorage.getItem('tabu-session');
    if (saved) {
      try { const session = JSON.parse(saved); queueMicrotask(() => { setRoomCode(session.code); setToken(session.token); setScreen('room'); }); return; } catch { localStorage.removeItem('tabu-session'); }
    }
    const invitedCode = new URLSearchParams(location.search).get('room');
    if (invitedCode) queueMicrotask(() => { setRoomCode(invitedCode.toUpperCase().slice(0, 6)); setScreen('join'); });
  }, []);

  useEffect(() => {
    if (screen !== 'room' || !roomCode || !token) return;
    queueMicrotask(() => fetchRoom());
    const poll = window.setInterval(() => fetchRoom(), 850);
    return () => window.clearInterval(poll);
  }, [screen, roomCode, token, fetchRoom]);

  const enterRoom = (session:{ code:string; token:string }) => {
    localStorage.setItem('tabu-session', JSON.stringify(session));
    setRoomCode(session.code); setToken(session.token); setScreen('room'); setError('');
  };

  const act = async (action:string, extra:Record<string, unknown> = {}) => {
    setBusy(true); setError('');
    try { const data = await api({ action, code:roomCode, token, ...extra }); if (data.status) setRoom(data); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Bir şeyler ters gitti.'); }
    finally { setBusy(false); }
  };

  const leave = () => { localStorage.removeItem('tabu-session'); setRoom(null); setRoomCode(''); setToken(''); setScreen('home'); };

  return (
    <main className="app-shell">
      <nav className="topbar">
        <button className="brand" onClick={leave} aria-label="Ana sayfa"><span className="brand-mark">T</span><span>TABU!</span></button>
        {screen === 'room' && room ? <span className="room-chip">ODA <b>{room.code}</b></span> : <span className="status-pill"><i /> Canlı oyun</span>}
      </nav>
      {error && <div className="toast" role="alert">{error}<button onClick={() => setError('')}>×</button></div>}
      {screen === 'home' && <HomeScreen roomCode={roomCode} setRoomCode={setRoomCode} onCreate={() => setScreen('create')} onJoin={() => setScreen('join')} />}
      {screen === 'create' && <Create onBack={() => setScreen('home')} onDone={enterRoom} setError={setError} setBusy={setBusy} busy={busy} />}
      {screen === 'join' && <Join initialCode={roomCode} onBack={() => setScreen('home')} onDone={enterRoom} setError={setError} setBusy={setBusy} busy={busy} />}
      {screen === 'room' && !room && <Loading />}
      {screen === 'room' && room?.status === 'lobby' && <Lobby room={room} busy={busy} act={act} leave={leave} />}
      {screen === 'room' && room?.status === 'playing' && <Game room={room} busy={busy} act={act} />}
      {screen === 'room' && room?.status === 'finished' && <Results room={room} busy={busy} act={act} />}
    </main>
  );
}

function HomeScreen({ roomCode, setRoomCode, onCreate, onJoin }:{ roomCode:string; setRoomCode:(v:string)=>void; onCreate:()=>void; onJoin:()=>void }) {
  return <>
    <section className="hero">
      <div className="eyebrow">Arkadaşlarını topla, kelimeleri konuştur</div>
      <h1>Yasaklı kelimelere<br /><em>yakalanma.</em></h1>
      <p>Takımını kur, odanı paylaş ve kahkaha dolu mücadeleyi başlat.</p>
      <div className="action-grid">
        <button className="create-card" type="button" onClick={onCreate}><span className="action-icon">＋</span><span><strong>Oyun Kur</strong><small>Ayarları seç ve odanı oluştur</small></span><b>→</b></button>
        <form className="join-card" onSubmit={(e) => { e.preventDefault(); if (roomCode.length >= 5) onJoin(); }}>
          <label htmlFor="room-code">Oda kodun var mı?</label><div><input id="room-code" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6))} placeholder="ÖRN. 8K4P2X" autoComplete="off" /><button type="submit" disabled={roomCode.length < 5}>Katıl</button></div>
        </form>
      </div>
    </section>
    <footer><span>⚡ Anlık skor</span><span>◉ Canlı takip</span><span>♟ Esnek takımlar</span></footer>
  </>;
}

function Create({ onBack, onDone, setError, setBusy, busy }:{ onBack:()=>void; onDone:(s:{code:string;token:string})=>void; setError:(s:string)=>void; setBusy:(v:boolean)=>void; busy:boolean }) {
  const [form, setForm] = useState({ name:'', playerLimit:4, duration:60, passLimit:2, targetScore:20, category:'Genel' });
  const submit = async (e:FormEvent) => { e.preventDefault(); setBusy(true); setError(''); try { onDone(await api({ action:'create', ...form })); } catch (x) { setError(x instanceof Error ? x.message : 'Oda kurulamadı.'); } finally { setBusy(false); } };
  return <section className="panel setup-panel"><button className="back" onClick={onBack}>← Geri</button><div className="panel-heading"><span className="step">01</span><div><h2>Oyununu kur</h2><p>Kuralları seç, oda kodunu arkadaşlarınla paylaş.</p></div></div>
    <form onSubmit={submit} className="settings-form">
      <label className="wide"><span>Adın</span><input required minLength={2} maxLength={24} placeholder="Örn. Alperen" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} /></label>
      <label><span>Oyuncu sınırı</span><select value={form.playerLimit} onChange={(e)=>setForm({...form,playerLimit:+e.target.value})}>{[2,3,4,5,6,7,8,9,10].map(n=><option key={n}>{n}</option>)}</select></label>
      <label><span>Tur süresi</span><select value={form.duration} onChange={(e)=>setForm({...form,duration:+e.target.value})}>{[30,45,60,90].map(n=><option key={n} value={n}>{n} saniye</option>)}</select></label>
      <label><span>Pas hakkı</span><select value={form.passLimit} onChange={(e)=>setForm({...form,passLimit:+e.target.value})}>{[0,1,2,3,4,5].map(n=><option key={n}>{n}</option>)}</select></label>
      <label><span>Hedef skor</span><select value={form.targetScore} onChange={(e)=>setForm({...form,targetScore:+e.target.value})}>{[10,15,20,30].map(n=><option key={n} value={n}>{n} puan</option>)}</select></label>
      <label className="wide"><span>Konu</span><select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
      <button className="primary wide" disabled={busy}>{busy ? 'Oda kuruluyor…' : 'Odayı Oluştur →'}</button>
    </form>
  </section>;
}

function Join({ initialCode, onBack, onDone, setError, setBusy, busy }:{ initialCode:string; onBack:()=>void; onDone:(s:{code:string;token:string})=>void; setError:(s:string)=>void; setBusy:(v:boolean)=>void; busy:boolean }) {
  const [code,setCode]=useState(initialCode), [name,setName]=useState('');
  const submit=async(e:FormEvent)=>{e.preventDefault();setBusy(true);setError('');try{onDone(await api({action:'join',code,name}));}catch(x){setError(x instanceof Error?x.message:'Odaya girilemedi.');}finally{setBusy(false);}};
  return <section className="panel compact-panel"><button className="back" onClick={onBack}>← Geri</button><div className="panel-heading"><span className="step lime">02</span><div><h2>Odaya katıl</h2><p>Kodunu ve oyunda görünecek adını yaz.</p></div></div><form onSubmit={submit} className="join-form"><label><span>Oda kodu</span><input className="code-input" required minLength={5} maxLength={6} value={code} onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6))} /></label><label><span>Adın</span><input required minLength={2} maxLength={24} placeholder="Örn. Ece" value={name} onChange={e=>setName(e.target.value)} /></label><button className="primary" disabled={busy}>{busy?'Katılınıyor…':'Oyuna Katıl →'}</button></form></section>;
}

function Lobby({ room, busy, act, leave }:{ room:Room; busy:boolean; act:(a:string,e?:Record<string,unknown>)=>void; leave:()=>void }) {
  const copy=()=>navigator.clipboard.writeText(`${location.origin}?room=${room.code}`);
  return <section className="panel lobby-panel"><div className="lobby-head"><div><span className="mini-label">ODA KODU</span><button className="big-code" onClick={copy}>{room.code} <small>Kopyala</small></button></div><div className="lobby-meta"><span>{room.players.length}/{room.settings.playerLimit} oyuncu</span><span>{room.settings.duration} sn</span><span>{room.settings.passLimit} pas</span><span>{room.settings.category}</span></div></div><div className="waiting"><i/><span>Oyuncular bekleniyor</span></div><div className="teams"><TeamBox team="A" players={room.players} me={room.me} onSwitch={()=>act('team',{team:'A'})}/><div className="versus">VS</div><TeamBox team="B" players={room.players} me={room.me} onSwitch={()=>act('team',{team:'B'})}/></div><div className="lobby-actions">{room.me?.isHost?<button className="primary" disabled={busy||room.players.length<2} onClick={()=>act('start')}>Oyunu Başlat →</button>:<p>Kurucu oyunu başlatınca hazırsın.</p>}<button className="text-button" onClick={leave}>Odadan ayrıl</button></div></section>;
}

function TeamBox({ team, players, me, onSwitch }:{ team:Team; players:Player[]; me:Room['me']; onSwitch:()=>void }) {
  const list=players.filter(p=>p.team===team); return <div className={`team-box team-${team.toLowerCase()}`}><div className="team-title"><span>TAKIM {team}</span><b>{list.length}</b></div><div className="player-list">{list.map((p,i)=><div className="player" key={p.id}><span>{p.name.slice(0,1).toUpperCase()}</span><strong>{p.name}{p.id===me?.id&&<small> sen</small>}</strong>{i===0&&<b>★</b>}</div>)}{!list.length&&<p>Henüz kimse yok</p>}</div>{me?.team!==team&&<button className="switch-team" onClick={onSwitch}>Bu takıma geç</button>}</div>;
}

function Game({ room, busy, act }:{ room:Room; busy:boolean; act:(a:string,e?:Record<string,unknown>)=>void }) {
  const game=room.game!; const [now,setNow]=useState(game.endsAt-room.settings.duration*1000), ended=useRef(false);
  useEffect(()=>{const timer=setInterval(()=>setNow(new Date().getTime()),250);return()=>clearInterval(timer);},[]);
  const seconds=Math.max(0,Math.ceil((game.endsAt-now)/1000));
  useEffect(()=>{if(seconds===0&&!ended.current&&(room.me?.id===game.currentPlayerId||room.me?.isHost)){ended.current=true;act('end_turn');}if(seconds>0)ended.current=false;},[seconds,room.me,game.currentPlayerId,act]);
  const narrator=room.me?.id===game.currentPlayerId, opponent=room.me?.team!==game.activeTeam;
  return <section className="game-stage"><header className="scorebar"><div className="score team-a"><span>TAKIM A</span><b>{room.scores.A}</b></div><div className={`timer ${seconds<=10?'danger':''}`}><small>KALAN SÜRE</small><b>{seconds}</b></div><div className="score team-b"><b>{room.scores.B}</b><span>TAKIM B</span></div></header><div className="turn-info"><span className={`team-dot team-${game.activeTeam.toLowerCase()}`}/><strong>{game.currentPlayerName}</strong> anlatıyor <small>Hedef: {room.settings.targetScore}</small></div>
    {game.card?<div className="word-card"><span className="category">{game.card.category}</span><h2>{game.card.word}</h2><div className="forbidden-title">SÖYLEME!</div><ul>{game.card.forbidden.map(word=><li key={word}>{word}</li>)}</ul></div>:<div className="hidden-card"><div className="lock">✦</div><h2>Kelime gizli</h2><p>{game.currentPlayerName} anlatıyor. Takımınla birlikte kelimeyi bul!</p></div>}
    <div className="game-controls">{narrator&&<><button className="pass" disabled={busy||game.passesLeft<1} onClick={()=>act('pass')}>Pas <small>{game.passesLeft}</small></button><button className="correct" disabled={busy} onClick={()=>act('correct')}>✓ Doğru</button><button className="end" disabled={busy} onClick={()=>act('end_turn')}>Turu Bitir</button></>}{opponent&&<button className="taboo" disabled={busy} onClick={()=>act('taboo')}>✕ TABU!</button>}{!narrator&&!opponent&&<span className="guess-note">Cevabı takımınla sesli tahmin et!</span>}</div>
  </section>;
}

function Results({ room,busy,act }:{room:Room;busy:boolean;act:(a:string)=>void}) { const winner=room.scores.A>room.scores.B?'A':'B'; return <section className="panel result-panel"><span className="confetti">✦</span><p className="mini-label">OYUN BİTTİ</p><h2>Takım {winner} kazandı!</h2><div className="final-score"><div className="team-a"><span>TAKIM A</span><b>{room.scores.A}</b></div><em>—</em><div className="team-b"><b>{room.scores.B}</b><span>TAKIM B</span></div></div><div className="result-teams">{(['A','B'] as Team[]).map(t=><div key={t}><strong>Takım {t}</strong><p>{room.players.filter(p=>p.team===t).map(p=>p.name).join(', ')}</p></div>)}</div>{room.me?.isHost?<button className="primary" disabled={busy} onClick={()=>act('restart')}>Tekrar Oyna</button>:<p>Kurucu yeni oyun başlatabilir.</p>}</section>; }

function Loading(){return <section className="loading"><div/><p>Odaya bağlanılıyor…</p></section>;}
