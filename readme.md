to run the server: 
node server.js


openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
--to genrate the certificate


your ip and port:
    https://192.168.0.seven:5000/


note use in other system: 
https://




run servers:


cd backend-python
python3 demo.py

cd video-to-text
node server.js    //to start an node server for the stroing video

for the transcript genration from the video:
cd video-to-text
node transcript.js