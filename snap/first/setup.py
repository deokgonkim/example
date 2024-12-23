from setuptools import setup, find_packages

setup(
    name="first",
    version="0.1",
    packages=find_packages(),
    entry_points={
        "console_scripts": [
            "first=first:main",
        ],
    },
    install_requires=[
    ],
)
