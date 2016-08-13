#!/bin/bash
bower install
npm install
( cd src ; tsd install )
( cd tests ; tsd install )
