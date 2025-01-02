import argparse

from . import module


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('target', type=str)
    parser.add_argument('name', type=str)
    args = parser.parse_args()

    module.client(args.target, args.name)


if __name__ == '__main__':
    main()
