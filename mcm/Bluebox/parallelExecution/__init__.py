#!/usr/bin/python
# coding=utf-8

"""
	Project MCM - Micro Content Management


	Copyright (C) <2016> Tim Waizenegger, <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.

	@author: tim
"""


class Borg:
	"""
		Singleton/BorgSingleton
		Alex Martelli's 'Borg'
		see http://www.aleax.it/Python/5ep.html
	"""
	_shared_state = {}

	def __init__(self):
		self.__dict__ = self._shared_state
