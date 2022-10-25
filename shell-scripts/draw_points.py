#!/usr/bin/env python3

## This script is for `draw.io`
## add points to a polygon

def points(x, y):
    x_list = [ i for i in range(0, 100, 100 // x) ]
    y_list = [ i for i in range(0, 100, 100 // y) ]
    x_list.append(100)
    y_list.append(100)
    grid = []
    for i in x_list:
        for j in y_list:
            grid.append([i/100, j/100])
    return grid

if __name__ == '__main__':
    x_count = int(input('X count : '))
    y_count = int(input('Y count : '))
    print('points=' + str(points(x_count, y_count)))
