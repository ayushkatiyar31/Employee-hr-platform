@echo off
echo Starting MongoDB...
mkdir "C:\data\db" 2>nul
mongod --dbpath "C:\data\db"