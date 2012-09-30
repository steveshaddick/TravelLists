#!/usr/bin/ruby
# hello1.cgi

require 'rubygems'
require 'fcgi'

require File.dirname(__FILE__) + '/../config/boot'
require File.dirname(__FILE__) + '/../config/environment'

counter = 0

FCGI.each_cgi('html3') do |cgi|
   counter += 1
   cgi.out {
     cgi.html {
       cgi.body {
         cgi.h1 { "Hello World!" } +
         cgi.p { "Counter: #{counter}" }
       }
     }
   }
end