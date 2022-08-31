import matplotlib.pyplot as plt
import numpy as np

x = np.arange(0,4*np.pi,0.1)   # start,stop,step
y = np.sin(2*x) + np.cos(3*x)

plt.plot(x, y)
plt.show()
