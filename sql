create table poll (id serial, question varchar(140), yes integer, no integer, ownerId integer, PRIMARY KEY(id));
create table vote(id serial, pollId integer,  userId integer, yes boolean, no boolean, PRIMARY KEY(id));