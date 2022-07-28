hello_sources = [
  'main.c',
  'hello-window.c',
  'hello-application.c',
]

hello_deps = [
  dependency('libadwaita-1', version: '>= 1.0'),
]

gnome = import('gnome')

hello_sources += gnome.compile_resources('hello-resources',
  'hello.gresource.xml',
  c_name: 'hello'
)

executable('hello', hello_sources,
  dependencies: hello_deps,
  install: true,
)
