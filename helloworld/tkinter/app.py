import tkinter as tk

# Create the main window
root = tk.Tk()
root.title("Hello World App")

# Set the geometry (size)
root.geometry("200x100")

# Create a label widget with "Hello, World!" text
label = tk.Label(root, text="Hello, World!")
label.pack()

# Run the application
root.mainloop()
