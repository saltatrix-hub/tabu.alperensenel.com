import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  hostToken: text('host_token').notNull(),
  status: text('status').notNull().default('lobby'),
  settings: text('settings').notNull(),
  scores: text('scores').notNull().default('{"A":0,"B":0}'),
  gameState: text('game_state'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (table) => [uniqueIndex('idx_rooms_code').on(table.code)]);

export const players = sqliteTable('players', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  team: text('team').notNull(),
  seat: integer('seat').notNull(),
  token: text('token').notNull(),
  joinedAt: integer('joined_at').notNull(),
}, (table) => [
  uniqueIndex('idx_players_token').on(table.token),
  uniqueIndex('idx_players_room_name').on(table.roomId, table.name),
  index('idx_players_room_team').on(table.roomId, table.team, table.seat),
]);
