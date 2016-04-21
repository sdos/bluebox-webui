# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2016> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""


"""

These values are just copied from the filter classes in 
	/osecm-metadataExtractor/osecm/metadataExtractor
It would be better to import those classes here, but that makes running the thing 
more complicated due to the many dependencies in the filters... 

"""

ImportFilterInterface = object

class ImportFilterBmp(ImportFilterInterface):
	'''
	classdocs
	@author: Christoph Trybek
	'''
	myName = 'bmp'
	myContentType = 'image/x-ms-bmp'

	myValidTagNames = [
		'image-size',
		'dpi',
		'compression'
	]

class ImportFilterGif(ImportFilterInterface):
	'''
	classdocs
	@author: Christoph Trybek
	'''
	myName = 'gif'
	myContentType = 'image/gif'

	myValidTagNames = [
		'image-size',
		'background',
		'duration'
	]
	
class ImportFilterJpeg(ImportFilterInterface):
	'''
	classdocs
	@author: Christoph Trybek
	'''
	myName = 'jpeg'
	myContentType = 'image/jpeg'

	myValidTagNames = [
		'image-datetime',
		'exif-lightsource',
		'image-gpsinfo',
		'exif-digitalzoomratio',
		'image-make',
		'image-yresolution',
		'image-model',
		'exif-exposuretime',
		'exif-exposuremode',
		'image-orientation',
		'exif-datetimeoriginal',
		'image-software',
		'exif-flash',
		'image-xresolution',
		'image-size'
	]



class ImportFilterPng(ImportFilterInterface):
	'''
	classdocs
	@author: Christoph Trybek
	'''
	myName = 'png'
	myContentType = 'image/png'

	myValidTagNames = [
		'image-size'
	]
	
	
class ImportFilterTiff(ImportFilterInterface):
	'''
	classdocs
	@author: Christoph Trybek
	'''
	myName = 'tiff'
	myContentType = 'image/tiff'

	myValidTagNames = [
		'image-size',
		'image-rowsperstrip',
		'image-predictor',
		'image-photometricinterpretation',
		'image-extrasamples',
		'image-stripoffsets',
		'image-orientation',
		'image-intercolorprofile',
		'image-planarconfiguration',
		'image-sampleformat',
		'image-samplesperpixel',
		'image-bitspersample',
		'image-stripbytecounts',
		'image-compression'
	]
	
	
	
class ImportFilterPDF(ImportFilterInterface):
	'''
	classdocs
	@author: Daniel Brühl
	'''
	myName = 'pdf'
	myContentType = 'application/pdf'
	myValidTagNames = [
		'title',
		'author',
		'creator',
		'creationdate',
		'producer',
		'moddate'
	]
	
	
	
class ImportFilterEmail(ImportFilterInterface):
	'''
	classdocs
	@author: Hoda Noori
	'''
	myName = 'email'
	myContentType = 'text/plain'

	myValidTagNames = ['content-transfer-encoding',
					   'to',
					   'from',
					   'subject',
					   'date',
					   'x-bcc',
					   'x-cc'
					   ]
