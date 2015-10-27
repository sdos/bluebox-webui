"""
	Project Bluebox
	2015, University of Stuttgart, IPVS/AS
"""
""" 
	Project Bluebox 
	
	Copyright (C) <2015> <University of Stuttgart>
	
	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""
from setuptools import setup

setup(name='Bluebox', version='1.0',
      description='Enterprise Content mgt. tool',
      author='blueboxteam', 
      author_email='bluebox@gmail.com',

      #  Uncomment one or more lines below in the install_requires section
      #  for the specific client drivers/modules your application needs.
      install_requires=['flask']
     )
