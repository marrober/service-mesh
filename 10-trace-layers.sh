cd 10-trace-layers
oc apply -f layer1.yaml
oc apply -f layer2.yaml
oc apply -f layer3.yaml
oc apply -f layer4.yaml
oc apply -f layer5.yaml
oc apply -f layer6.yaml
oc apply -f layer7.yaml
oc delete destinationRule --all
oc delete virtualService --all
oc apply -f virtual-service-layer-1.yaml
oc apply -f virtual-service-layer-2.yaml
oc apply -f virtual-service-layer-3.yaml
oc apply -f virtual-service-layer-4.yaml
oc apply -f virtual-service-layer-5.yaml
oc apply -f virtual-service-layer-6.yaml
oc apply -f virtual-service-layer-7.yaml
cd ..