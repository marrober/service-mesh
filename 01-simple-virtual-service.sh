oc new-project service-mesh-01
oc create -f servicemeshmember.yaml
cd 01-simple-virtual-service
oc create --save-config -f layer1.yaml
oc create --save-config -f gateway-layer1.yaml
oc create --save-config -f virtual-service-layer1.yaml
oc create --save-config -f layer2.yaml 
oc create --save-config -f virtual-service-layer2.yaml 
echo $(oc -n istio-system get route istio-ingressgateway -o jsonpath='{.spec.host}{"/call-layers"}')
cd ..
