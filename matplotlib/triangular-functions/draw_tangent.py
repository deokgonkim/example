import matplotlib.pyplot as plt
import numpy as np

x = np.arange(-0.5 * np.pi, 0.5 * np.pi, 0.01)   # start,stop,step
y = np.tan(-x)

plt.title("SK fertility rate")
plt.plot(x, y)
plt.ylim(-20, 20)
plt.show()
