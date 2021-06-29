oc new-project service-mesh-01
oc create -f servicemeshmember.yaml
cd phase1
oc create --save-config -f layer1.yaml
oc create --save-config -f gateway-layer1.yaml
oc create  --save-config -f virtual-service-layer1.yaml
export GATEWAY=$(oc -n istio-system get route istio-ingressgateway -o jsonpath='{.spec.host}{"/call-layers"}') 
echo $GATEWAY
cd ..
