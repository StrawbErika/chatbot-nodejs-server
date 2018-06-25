CREATE USER 'shortcake'@'localhost' IDENTIFIED BY 'tiger';
CREATE DATABASE sim;
GRANT ALL ON sim.* TO 'shortcake'@'localhost';

USE sim;

CREATE TABLE salgrade(
grade NUMERIC(3),
losal NUMERIC(5),
hisal NUMERIC(5)
);

CREATE TABLE dept(
deptno NUMERIC(2),
dname VARCHAR(14),
loc VARCHAR(13),
constraint dept_dname_uk unique(dname),
constraint dept_deptno_pk primary key(deptno)
);

CREATE TABLE emp(
empno NUMERIC(4) not null,
ename VARCHAR(10),
job VARCHAR(9),
mgr NUMERIC(4),
hiredate DATE,
sal NUMERIC(7,2),
comm NUMERIC(7,2),
deptno NUMERIC(2),
constraint emp_empno_pk primary key(empno),
constraint emp_deptno_fk foreign key(deptno) references dept(deptno),
constraint emp_deptno_ck CHECK(deptno between 10 and 99) 
);

CREATE TABLE bonus(
ename VARCHAR(10),
job VARCHAR(9),
sal NUMERIC(7,2),
comm NUMERIC(7,2)
);

insert into dept values(10, 'ACCOUNTING', 'NEW YORK');
insert into dept values(20, 'RESEARCH', 'DALLES');
insert into dept values(30, 'SALES', 'CHICAGO');
insert into dept values(40, 'OPERATIONS', 'BOSTON');

insert into salgrade values(1,700,1200);
insert into salgrade values(2,1201,1400);
insert into salgrade values(3,1401,2000);
insert into salgrade values(4,2001,3000);
insert into salgrade values(5,3001,9999);

insert into emp
values(
7369, 'SMITH','CLERK', 7902, str_to_date('17-DEC-1980','%d-%M-%Y'), 800, NULL, 20
);

insert into emp
values(
7499, 'ALLEN','SALESMAN', 7698, str_to_date('20-FEB-1981','%d-%M-%Y'), 1600, 300, 30
);

insert into emp
values(
7521, 'WARD','SALESMAN', 7698, str_to_date('22-FEB-1981','%d-%M-%Y'), 1250, 500, 30
);

insert into emp
values(
7566, 'JONES','MANAGER', 7839, str_to_date('02-APR-1981','%d-%M-%Y'), 2975, NULL, 20
);

insert into emp
values(
7654, 'MARTIN','SALESMAN', 7698, str_to_date('28-SEP-1981','%d-%M-%Y'), 1250, 1400, 30
);

insert into emp
values(
7698, 'BLAKE','MANAGER', 7839, str_to_date('01-MAY-1981','%d-%M-%Y'), 2850, NULL, 30
);

insert into emp
values(
7782, 'CLARK','MANAGER', 7839, str_to_date('09-JUN-1981','%d-%M-%Y'), 2450, NULL, 10
);

insert into emp
values(
7788, 'SCOTT','ANALYST', 7566, str_to_date('19-APR-1987','%d-%M-%Y'), 3000, NULL, 20
);

insert into emp
values(
7839, 'KING','PRESIDENT', NULL, str_to_date('17-NOV-1981','%d-%M-%Y'), 5000, NULL, 10
);

insert into emp
values(
7844, 'TURNER','SALESMAN', 7698, str_to_date('08-SEP-1981','%d-%M-%Y'), 1500, 0, 30
);

insert into emp
values(
7876, 'ADAMS','CLERK', 7788, str_to_date('23-MAY-1987','%d-%M-%Y'), 1100, NULL, 20
);

insert into emp
values(
7900, 'JAMES','CLERK', 7698, str_to_date('03-DEC-1981','%d-%M-%Y'), 950, NULL, 30
);

insert into emp
values(
7902, 'FORD','ANALYST', 7566, str_to_date('03-DEC-1981','%d-%M-%Y'), 1300, NULL, 20
);

insert into emp
values(
7934, 'MILLER','CLERK', 7782, str_to_date('23-JAN-1982','%d-%M-%Y'), 1300, NULL, 10
);
