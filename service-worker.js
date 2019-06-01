importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.4.1/workbox-sw.js')

if (workbox) {
  console.log('yay! worbox working!')
   workbox.precaching.precacheAndRoute([]);

} else {
  console.log('boo! workbox is being a jerkbox');
}
