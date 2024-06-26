from kivy.app import App
from kivy.uix.floatlayout import FloatLayout
from kivy.uix.label import Label
from kivy.uix.button import Button


class HelloWorldApp(App):
    def quit(self, instance):
        self.stop();

    def build(self):
        layout = FloatLayout()
        label = Label(text='Hello, World!', size_hint=(.2, .2), pos_hint={'x':.4, 'y':.6})
        button = Button(text="Quit", size_hint=(.2, .2), pos_hint={'x':.4, 'y':.3})
        button.bind(on_press=self.quit)
        layout.add_widget(label)
        layout.add_widget(button)
        return layout

if __name__ == '__main__':
    HelloWorldApp().run()
