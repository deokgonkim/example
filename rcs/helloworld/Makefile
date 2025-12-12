##
# $Id: Makefile,v 1.1 2024/06/10 08:08:42 eric Exp $
# 
# $Log: Makefile,v $
# Revision 1.1  2024/06/10 08:08:42  eric
# Initial revision
#
##

CC=gcc
CFLAGS=-I.

hello: hello.o
	$(CC) -o hello hello.o

hello.o: hello.c
	$(CC) -c hello.c

clean:
	rm -f hello.o hello

