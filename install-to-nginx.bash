set -xe

npm build
rm -r -f /var/www/1spaced
cp -r dist /var/www/1spaced
chown -R www-data:www-data /var/www
