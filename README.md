# Manual

**Clone the repository**

`git clone https://github.com/Philipp-Sc/learning.git`

`cd learning`

**Https** *(required)*

* Put the ssh certificates (cert.pem, privkey.pem) for your domain here. 
* You may use https://hub.docker.com/r/certbot/certbot/ to generate the certificates with Let's Encrypt. 

**Build the Docker image**

`docker build -t philipp-sc/learning `

**Start the container and run the ExpressJS server**

`docker run --name=learning-xtreme -d -p 443:8080 philipp-sc/learning npm start`

*Make sure the port 443 is open to accept incoming requests*

**View the logs**

`docker logs learning-xtreme`


``
# License
<a href="https://www.philipp-schluetermann.de/about/"> Philipp Schlütermann </a> may distribute, remix, adapt, and build upon this work, even commercially.

You may distribute, remix, adapt, and build upon this work for non-commercial use, provided that the following conditions are met:
1. Redistributions this work must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Neither the name of Philipp Schlütermann nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
3. Commercial use is prohibited without specific prior written permission from the author.

THIS SOFTWARE IS PROVIDED AS IS AND WITHOUT ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
