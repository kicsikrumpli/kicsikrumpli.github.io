#Introduction to Apache

## httpd.conf

		# listens on all interfaces on port 80
		Listen 80

		# document root
		# DocumentRoot "/var/www/html"
		# if http request url is http://example.com/foo.html
		# the file /var/www/html/foo.html will be served
		DocumentRoot "/var/www/html"
		
		# server root
		# folder that contains Apache config, log, and error files
		ServerRoot "/etc/httpd"
		
		# identity
		# root reserves privileged port 80, then spawns processes with given user
		# Os performs access control checks to the file system against these users
		User apache
		Group apache
		
		# loaded modules
		LoadModule status_module modules/mod_status.so
		LoadModule proxy_module modules/mod_proxy.so
		# ... and a bunch more
		
		# multi process settings
		StartServers 	8
		MinSpareServers	5
		MaxSoareServers	20
		ServerLimit		256
		maxClients		256
		
		# container directives
		# xml-style opening and closing tags
		# restricst scope of contained directives
		# these directives only take effect for files within specified directory
		<Directory "/var/www/cgi-bin">
			AllowOverride None
			Options None
			Order allow, deny
			Allow from all
		</Directory>
		
		# Other containers
		#   <Location /path> matches the path part of the url
		#   <VirtualHost>
		#   <Files "*.jpg"> matches files
		#   <IfModule moduleName> - directives are only in effect when specified module is loaded
		
		# Load other config files
		# by convention conf.d contains additional configuration
		# files are processed in alphabetical order
		Include conf.d/*.conf
		
		# DirectoryIndex sets the file apache looks for when only a directory is given in the url
		DirectoryIndex index.html index.html.var
		
## Virtual Hosting
> Hosting multiple domain names with separate handling on a single (pool of) servers

### Name Based Virtual Hosting
- all domain names resolve to the same ip
- e.g. 
	- east.example.org -> common ip -> via apache: virtual host "East" w/ document root /var/www/html/east
	- west.example.org -> common ip -> via apache: virtual host "West" w/ document root /var/www/html/west 
- name based hosting differentiates between hosts by the `Host: east.example.org` field of the Http request headers
- when name based virtual hosting is enabled, the single site previously served by apache has to be reconfigured as an additional virtual host
- requests that don't match any of the virtual hosts are served with the first virtual host defined in the config file
- most common directives can be put in the virtual host containers too

	
		NameVirtualHost *:80
		
		# first one is the default for requests that don't match any of the virtual hosts
		<VirtualHost *:80>
			ServerName east.example.org
			ServerAlias eastexample
			DocumentRoot /var/www/html/east
			ErrorLog /var/log/httpd/east/error_log
			TransferLog /var/log/httpd/east/access_log
		</VirtualHost>

		<VirtualHost *:80>
			ServerName west.example.org
			DocumentRoot /var/www/html/west
		</VirtualHost>

### IP Based Virtual Hosting
- Apache serves every network interface
- each site resolves to a different ip address
- based on the ip Apache decides what content to serve

### Other Options
Other options to serve multiple sites:
- run multiple Apache instances on the same machine each listening to different ports; each instance has its own separate config
- run multiple VMs

## Apache Access Control
- Access control via authentication and authorization
- Store account info in
	- plaintext - yuck
	- mySql db
	- DBM files

### Plaintext
- do not place it in the document root!
- place it at - for example - /etc/httpd/conf
- manage via `htpasswd` cmd

		# example
		htpasswd -c -m librarians jim
		-c: create file
		-m: use md5 hash
		-librarians is the file to add the user to
		-jim is the user

### Access control for a directory

		<Directory /var/www/html/east/admin>
			# Basic Auth sends passwords in plaintext - use with ssl
			AuthType Basic
			# Define an Authorization Realm
			AuthName "Log in as a librarian"
			AuthUserFile /etc/httpd/conf/librarians
			# we could give an explicit list of users too
			Require valid-user
		</Directory>
		
### Access Control Based on Machine Identity
Probably of little use unless restricting to local network

		<Directory /var/www/html/east/admin>
			# last match is applied
			order deny, allow
			deny from all
			# CIDR address block, IP, Network/Netmask, full or partial domain name
			allow from 192.168.1.0/24
		</Diretory>

### Access Control with `.htaccess`
- Place file in directory
- effect of .htaccess files accumulate as apache traverses the directory structure to a given file
- `.htaccess` is the default name, can be overridden in `httpd.conf`
- top level apache config declares what can be controlled with htaccess

	| AllowOverride | effect |
	| --- | --- |
	| None | .htaccess is ignored |
	| All | every directive |
	| AuthConfig | authentication directives |
	| Indexes | directives for controlling directory listing |
	| Limit | directives for controlling host access |
	
	example: `AllowOverride AuthConfig Indexes`

- Pros: non need for root access to modify behaviour, no need to restart server
- Cons: performance

## Secure Connections with SSL
### Encryption / Decription

					 +---+					+---------+					 +---+
		plaintext -> | E | -> Ciphertext -> | channel | -> Ciphertext -> | D | -> plaintext
					 +---+					+---------+					 +---+
					   A												   A
					   |												   |
				 Encryption Key										Decryption Key

- asymmetric cryptography: encryption and decryption keys are different
	- Encryption key: public
	- Decryption key: private, encrypted with passphrase, stored in keyfile
- symmetric cryptography
	- Encryption and Decryption keys are the same
	- security is based on the security of the key

### Hashes
- one way transformation
- variable length input, fixed length output

### Digital Signatures
Is the transmitted copy of a file identical to the original?

                     +----------+
		 File -----> | transmit | -> Copy of File
		   |         +----------+        |
           V                             V
		+------+                      +------+ 
		| hash |                      | hash |
		+------+                      +------+
		   |							 V
		   |                        +---------+ 
           |                        | Compare |---> Same?
           |		                +---------+
		   V                             A
		 +---+                         +---+
		 | E | <- private key          | D | <- public key
		 +---+                         +---+
		   |                             A
		   V         +----------+        |
		Signature -> | transmit | -> Signature
					 +----------+

1. Originator signs the **File**
	- hash **File**
	- encrypt hash with **Private Key**
	- encrypted hash is the **Signature**
2. Transmit **File** and **Signature**
3. **File** is hashed on the receiveing end
4. **Signature** is decrypted with **Public Key** on the receiving end
5. If the decrypted signature and the hash calculated on the receveng end match, we have high confidence, that the received file matches the original

**NB!** Important assumption: the **Public Key** belongs to the site whose **File** is checked

### Digital Certificates
- Securely identifies a web site
- Confirms that a site's domain name and Public Key really belong together

Contains:
- Issuer's identity (CA: Ceritfication Authority)
- Site's domain name
- Site's **Public Key**
- Expiry date
- Signature of CA

### Obtaining a Digital Certificate
1. CA has a private key - public key pair
2. Site generates a private key - public key pair
3. Certificate request is sent to CA
	- with the site's public key
	- site's url and information
4. CA creates certificate
	- CA info
	- Site's url and information
	- Site's public key
	- Digital Signature: hash of certificate encrypted with CA's private key
5. Certificate is sent back to the site: **X.509 Certificate**

### SSL -Secure Socket Layer
- Sits above TCP
- Verifies server identity
- Negotiates a **Symmetric** session key

### SSL Connection
1. Browser connects to website
2. website send **X.509** certifacte to browser
3. browser verifies the signature of the certificate from a list of known CA-s with their public keys
	- hash certificate
	- decrypt signature in certificate with public key
	- compare hash and decrypted signature
	- if verification succeeds, browser trusts information in the certificate, in particular the site's **public key**
4. Browser encrypts a **random value** with the site's public key
5. Browser sends encrypted random value to the website
6. Website decrypts random value with its private key
7. From the shared random value both sides generate a **Symmetric Session Key**

All communication is encrypted with the **Symmetric Session Key**

### OpenSSL
- creates and manages public and private keys
- creates x.509 certificates and certificate requests
- hashing (message digest)
- encryption and decryption

### mod_ssl
Apache module that provides SSL support
- mod_ssl.so
- config file added to `/etc/httpd/conf.d` directory

Configuration directives
- `SSLCertificateFile` file that contains the site's certificate
- `SSLCertificateKeyFile` file that contains the site's **private key**
- `SSLCypherSuite` encryption algorithms that browsers may use
- `SSLEngine` on | off
- `SSLRequire` access control based on various parameters

### demo

		> mkdir /etc/httpd/ssl
		> openssl req -x509 \					generate a self signed x509 certificate
		  -nodes \								don't encrypt private key file
		  -days 365 							set expiry date on certificate
		  -newkey rsa:2048 \					generate a new 2048 bit rsa key
		  -keyout /etc/httpd/ssl/apache.key \ 	name of generated key file
		  -out /etc/httpd/ssl/apache.crt 		name of generated certificate file
		
		# check generated certificate
		> openssl x509 -in /etc/http/ssl/apache.crt -text | less
		> yum install mod_ssl
		
		# edit installed configuration file `/etc/httpd/conf.d/ssl.conf`
		LoadModule ssl_module modules/mod_ssl.so
		Listen 443
		
		NameVirtualHost *:443
		<VirtualHost *:443>
			DocumentRoot /var/www/html/east
			ServerName east.example.org
		</VirtualHost>
		
		SSLCertificateFile /etc/httpd/ssl/apache.crt
		SSLCertificateKeyFile /etc/httpd/ssl/apache.key
		
		>hostname east.example.org
		# edit `/etc/httpd/conf/httpd.conf`
		ServerName east.example.org
		
## Logging
- LogFormat ... -> named pattern
- CustomLog file logformat-name -> output file relative to ServerRoot
- separate CustomLog directives per VirtualHost containers
- ErrorLog file -> write error logs to specified file
- ErrorLog "|var/somcmd" -> pipe error logs into specified program
- ErrorLog syslog:local3 -> sends log to system log with "local3" facility name
- LogLevel

### Server-Status handler
status of server
		
		ExtendedStatus on
		
		<Location /server-status>
			SetHandler server-status
			Order deny, allow
			Deny from all
			Allow from loaclhost
		</Localtion>
		
### Server-Info handler
build and config of server

		<Location /server-info>
			SetHandler server-info
			Order deny, allow
			Deny from all
			Allow from loaclhost
		</Localtion>
