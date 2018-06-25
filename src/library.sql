DROP DATABASE library;
CREATE DATABASE library;

USE library;

CREATE TABLE user(
uid VARCHAR(200),
constraint user_uid_pk primary key(uid)
);

CREATE TABLE book(
bid VARCHAR(100),
title VARCHAR(100),
author VARCHAR(100),
category VARCHAR(100),
uid VARCHAR(100),
constraint book_borrower foreign key(uid) references user(uid)
);


insert into book values(1,"hello","jk", "boring", NULL);
insert into book values(2,"hi1","jk1", "boring1", NULL);
insert into book values(3,"bye2","jk2", "boring2", NULL);
insert into book values(4,"oops3","jk3", "boring3", NULL);
insert into book values(5,"hello4","jk4", "boring4", NULL);

