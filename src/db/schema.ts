import { pgTable, uuid, varchar, text, timestamp, integer, boolean, jsonb, index, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core';
export const userRole=pgEnum('user_role',['user','admin','recruiter']);
export const userTable=pgTable('users',{
  id:uuid('id').defaultRandom().primaryKey(), email:varchar('email',{length:254}).notNull().unique(),
  passwordHash:text('password_hash').notNull(), role:userRole('role').notNull().default('user'),
  failedLogins:integer('failed_logins').notNull().default(0), lockedUntil:timestamp('locked_until',{withTimezone:true}),
  suspendedAt:timestamp('suspended_at',{withTimezone:true}), createdAt:timestamp('created_at',{withTimezone:true}).defaultNow().notNull(),
});
export const profiles=pgTable('profiles',{
  userId:uuid('user_id').primaryKey().references(()=>userTable.id,{onDelete:'cascade'}),
  name:varchar('name',{length:120}).notNull().default(''),phone:varchar('phone',{length:40}).notNull().default(''),
  location:varchar('location',{length:150}).notNull().default(''),headline:varchar('headline',{length:180}).notNull().default(''),
  photoPath:text('photo_path'), showPhone:boolean('show_phone').notNull().default(false),showEmail:boolean('show_email').notNull().default(false),
  updatedAt:timestamp('updated_at',{withTimezone:true}).defaultNow().notNull()
});
export const sessions=pgTable('sessions',{
  id:uuid('id').defaultRandom().primaryKey(),userId:uuid('user_id').notNull().references(()=>userTable.id,{onDelete:'cascade'}),
  tokenHash:varchar('token_hash',{length:64}).notNull().unique(),expiresAt:timestamp('expires_at',{withTimezone:true}).notNull(),
  revokedAt:timestamp('revoked_at',{withTimezone:true}),createdAt:timestamp('created_at',{withTimezone:true}).defaultNow().notNull()
},t=>[index('session_owner_idx').on(t.userId)]);
export type CVItem={id:string;title:string;subtitle?:string;start?:string;end?:string;description?:string;};
export type CVContent={summary:string;experience:CVItem[];education:CVItem[];skills:CVItem[];projects:CVItem[];certifications:CVItem[];languages:CVItem[];references:CVItem[]};
export const emptyCV:CVContent={summary:'',experience:[],education:[],skills:[],projects:[],certifications:[],languages:[],references:[]};
export const cvs=pgTable('cvs',{
  id:uuid('id').defaultRandom().primaryKey(),userId:uuid('user_id').notNull().references(()=>userTable.id,{onDelete:'cascade'}),
  title:varchar('title',{length:150}).notNull(),template:varchar('template',{length:24}).notNull().default('classic'),
  content:jsonb('content').$type<CVContent>().notNull().default(emptyCV),publicDiscoverable:boolean('public_discoverable').notNull().default(false),
  revision:integer('revision').notNull().default(1),createdAt:timestamp('created_at',{withTimezone:true}).defaultNow().notNull(),updatedAt:timestamp('updated_at',{withTimezone:true}).defaultNow().notNull()
},t=>[index('cvs_user_idx').on(t.userId),index('cvs_public_idx').on(t.publicDiscoverable)]);
export const cvVersions=pgTable('cv_versions',{
  id:uuid('id').defaultRandom().primaryKey(),cvId:uuid('cv_id').notNull().references(()=>cvs.id,{onDelete:'cascade'}),
  revision:integer('revision').notNull(),title:text('title').notNull(),content:jsonb('content').$type<CVContent>().notNull(),
  template:text('template').notNull(),createdAt:timestamp('created_at',{withTimezone:true}).defaultNow().notNull()
},t=>[uniqueIndex('cv_version_unique').on(t.cvId,t.revision)]);
export const shareLinks=pgTable('share_links',{
  id:uuid('id').defaultRandom().primaryKey(),cvId:uuid('cv_id').notNull().references(()=>cvs.id,{onDelete:'cascade'}),
  tokenHash:varchar('token_hash',{length:64}).notNull().unique(),expiresAt:timestamp('expires_at',{withTimezone:true}),
  revokedAt:timestamp('revoked_at',{withTimezone:true}),hideEmail:boolean('hide_email').notNull().default(true),hidePhone:boolean('hide_phone').notNull().default(true),
  createdAt:timestamp('created_at',{withTimezone:true}).defaultNow().notNull()
},t=>[index('share_cv_idx').on(t.cvId)]);
export const uploads=pgTable('uploads',{
  id:uuid('id').defaultRandom().primaryKey(),userId:uuid('user_id').notNull().references(()=>userTable.id,{onDelete:'cascade'}),
  filename:varchar('filename',{length:200}).notNull(),pathname:text('pathname').notNull(),mime:varchar('mime',{length:90}).notNull(),
  bytes:integer('bytes').notNull(),createdAt:timestamp('created_at',{withTimezone:true}).defaultNow().notNull()
},t=>[index('uploads_owner_idx').on(t.userId)]);
export const resetTokens=pgTable('reset_tokens',{
  id:uuid('id').defaultRandom().primaryKey(),userId:uuid('user_id').notNull().references(()=>userTable.id,{onDelete:'cascade'}),
  tokenHash:varchar('token_hash',{length:64}).notNull().unique(),expiresAt:timestamp('expires_at',{withTimezone:true}).notNull(),
  consumedAt:timestamp('consumed_at',{withTimezone:true})
});
export const rateLimits=pgTable('rate_limits',{
  key:varchar('key',{length:64}).primaryKey(),hits:integer('hits').notNull().default(0),windowEnd:timestamp('window_end',{withTimezone:true}).notNull()
});
export const flags=pgTable('flags',{
  id:uuid('id').defaultRandom().primaryKey(),cvId:uuid('cv_id').notNull().references(()=>cvs.id,{onDelete:'cascade'}),
  reporterId:uuid('reporter_id').references(()=>userTable.id,{onDelete:'set null'}),reason:varchar('reason',{length:500}).notNull(),
  status:varchar('status',{length:16}).notNull().default('open'),createdAt:timestamp('created_at',{withTimezone:true}).defaultNow().notNull()
});
export const audits=pgTable('audits',{
  id:uuid('id').defaultRandom().primaryKey(),actorId:uuid('actor_id').references(()=>userTable.id,{onDelete:'set null'}),
  action:varchar('action',{length:70}).notNull(),targetId:uuid('target_id'),
  createdAt:timestamp('created_at',{withTimezone:true}).defaultNow().notNull(),
},t=>[index('audit_action_idx').on(t.action,t.createdAt)]);
