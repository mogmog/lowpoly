console.log(":sw");
console.log(self);

self.addEventListener('fetch', function(event) {

    //console.log(123);

    event.respondWith(
        caches.open('mysite-dynamic').then(function(cache) {

           //   console.log('fetch', event);

            return cache.match(event.request).then(function (response) {
                return response || fetch(event.request).then(function(response) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});