cd phase4
oc create -f layer2-A.yaml --save-config
oc create -f layer2-B.yaml --save-config
oc apply -f virtual-service-layer1.yaml
oc create -f destination-rule-layer1.yaml --save-config
oc create -f destination-rule-virtual-service-layer2-A.yaml --save-config
oc create -f destination-rule-virtual-service-layer2-B.yaml --save-config
oc apply -f layer1.yaml
cd ..