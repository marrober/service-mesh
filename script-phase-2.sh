cd phase2
oc create -f layer2.yaml --save-config
oc create -f virtual-service-layer2.yaml --save-config
oc apply -f layer1.yaml
cd ..
cd phase3
oc create -f layer3.yaml
oc create -f destination-rule-virtual-service-layer3.yaml
oc apply -f destination-rule-virtual-service-layer2.yaml
oc apply -f layer2.yaml
cd ..