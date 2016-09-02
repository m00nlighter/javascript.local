open console and cd to your openserver domains directory
run git clone https://github.com/m00nlighter/javascript.local.git
configure your openserver for two domains
javascript.local -> javascript.local/web
api.javascript.local -> javascript.local/api

create database
change config file in config/db.php

and run this commands in javascript.local folder

echo y | yii migrate /force
cd web
npm install
bower install
gulp app:run
