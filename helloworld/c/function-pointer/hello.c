#include <stdio.h>
#include <stdlib.h>

int someFunction(int);

int intPointerReceiver(int *);

int functionReceiver(int (*func)(), int);


int main(int argc, char* argv[]) {
    int *i;

    i = malloc(sizeof(i));

    *i = 3;

//    intPointerReceiver(i);

    int (*func)(int);
    func = &someFunction;
    (*func)(100);
    functionReceiver(func, 10);

    (*(&someFunction))(30);
}


int someFunction(int a) {
    printf("This is someFunction %d\n", a);
}

int intPointerReceiver(int *i) {
    printf("This function received %d", *i);
}

int functionReceiver(int (*f)(), int a) {
    return (*f)(a);
}
