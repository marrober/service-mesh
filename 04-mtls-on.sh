cd 04-mtls
oc create --save-config -f peer-authentication-mtls.yaml
oc delete dr --all
oc create --save-config -f destinationrule-mtls.yaml
cd ..
oc apply -f 01-simple-virtual-service/virtual-service-layer1.yaml
oc apply -f 01-simple-virtual-service/virtual-service-layer2.yaml
