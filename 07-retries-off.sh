oc apply -f 01-simple-virtual-service/layer2.yaml 
cd 02-traffic-control
oc apply -f destination-rule-layer2.yaml
oc apply -f virtual-service-layer2.yaml
cd ..
