cd 06-fault-injection
oc apply -f layer1.yaml                     
oc apply -f layer2-A.yaml
oc apply -f layer2-B.yaml
oc apply -f destination-rule-virtual-service-layer1.yaml    
oc apply -f destination-rule-virtual-service-layer2-A.yaml  
oc apply -f destination-rule-virtual-service-layer2-B.yaml  
cd ..
