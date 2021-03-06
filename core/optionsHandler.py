# -*- coding: utf-8 -*-
import os, time
from sys import argv
from commons import log

try: import json
except ImportError: import simplejson as json

default_options={ 'ScanOnStart' : True, 'WebOnStart' : True, 'BrowserOnWebStart' : True, 'port' : 8000, 'lang' : '', 'NotLocate': False, 'always-loc': False, 'sleep':(5,60,10), 'password': '', 'TriggeredOnStart' : False, 'password' : '' }
options = {}

confdir = os.getenv("HOME") + os.sep + '.wilocate' + os.sep

def touch(files):
  for f in files:
    fo = open(f,'w')
    if not fo.closed:
      fo.close()


def genLogPath():

  tm = time.strftime("%d-%b-%Y", time.gmtime())

  dirr = confdir + 'log-' + tm
  if not os.path.exists(dirr):
    os.makedirs(dirr)

  i=0
  path = dirr + os.sep + str(i) + '.log'
  while os.path.exists(path):
    i+=1
    path = dirr + os.sep + str(i) + '.log'

  touch([ path ])

  return path

def saveOptions():
    f = open(confdir + 'wilocate.conf','w')

    options_to_save = options.copy()
    options_to_save['password']=''

    f.write(json.dumps(options_to_save, indent=4))
    f.close()

def setDefaultOptions():

  global options

  options = default_options.copy()

  lang = os.getenv('LANG')
  if lang:
    if '.' in lang:
      lang=lang.split('.')[0]
    options['lang']=lang


def loadOptions():

  global options


  if not os.path.exists(confdir):
    os.makedirs(confdir)

  if not os.path.exists(confdir + 'wilocate.conf'):
    setDefaultOptions()
    log('No config founded, loaded default options.')
    saveOptions()

  else:
    try:
      f = open(confdir + 'wilocate.conf','r')
      options = json.loads(f.read())
    except Exception, e:
      setDefaultOptions()
      log('Error loading or parsing config file, loaded default options.')

  options['password']=''
  return options
