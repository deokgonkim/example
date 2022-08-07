

def for_even(n):
    return n/2

def for_odd(n):
    return (n*3+1)/2

def main():
    n = int(input("N: "))
    while True:
        if n == 1:
            print("result 1")
            break
        elif n % 2 == 0:
            n = for_even(n)
        else:
            n = for_odd(n)
        print(n)


if __name__ == '__main__':
    main()
