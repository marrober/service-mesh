echo "clear mTLS"

oc apply -f 04-mtls/mtls-off.yaml
oc delete peerauthentication.security.istio.io/default
oc delete dr --all
oc apply -f 01-simple-virtual-service/virtual-service-layer1.yaml
oc apply -f 01-simple-virtual-service/virtual-service-layer2.yaml 



































