create table poll (id serial, question varchar(140), ownerId integer, PRIMARY KEY(id));
create table vote(pollId integer, userId integer, yes boolean, no boolean, PRIMARY KEY(pollId, userId));
create table account(id serial, login varchar(32), email varchar(255), avatar varchar(255), PRIMARY KEY(id));
create table pendinglogin(token varchar(96), accountId integer, PRIMARY KEY(token));
create table pollDoc (id integer, json text);