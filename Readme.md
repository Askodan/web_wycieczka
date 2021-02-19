Strona pozwalająca tykać rolety i podglądać czy się tykają

# Generating certificates
source [https://www.rosehosting.com/blog/how-to-generate-a-self-signed-ssl-certificate-on-linux/] 
Create RSA Keypair
`openssl genrsa -des3 -passout pass:x -out keypair.key 2048`
`pass:x` should be changed to some other password, for example `pass:nietylkox` 

Extract private key
`openssl rsa -passin pass:x -in keypair.key -out httpscertificate/kartofel.key`
`rm keypair.key`

Create csr file
`openssl req -new -key httpscertificate/kartofel.key -out httpscertificate/kartofel.csr`

Create certificate
`openssl x509 -req -days 365 -in httpscertificate/kartofel.csr -signkey httpscertificate/kartofel.key -out httpscertificate/kartofel.crt`
