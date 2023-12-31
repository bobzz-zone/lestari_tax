from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in lestari/__init__.py
from lestari import __version__ as version

setup(
	name="lestari",
	version=version,
	description="For Lestari",
	author="DAS",
	author_email="digitalasiasolusindo@gmail.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
