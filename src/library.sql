DROP DATABASE library;
CREATE DATABASE library;

USE library;

CREATE TABLE user(
uid VARCHAR(200),
name VARCHAR(300),
constraint user_uid_pk primary key(uid)
);

CREATE TABLE book(
bid VARCHAR(100),
img VARCHAR(200),
title VARCHAR(100),
author VARCHAR(100),
category VARCHAR(100),
uid VARCHAR(100),
constraint book_borrower foreign key(uid) references user(uid)
);


