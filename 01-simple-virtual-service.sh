oc new-project service-mesh-01
oc create -f servicemeshmember.yaml
sleep 20
cd 01-simple-virtual-service
oc create --save-config -f layer1.yaml
oc create --save-config -f gateway-layer1.yaml
oc create --save-config -f virtual-service-layer1.yaml
oc create --save-config -f layer2.yaml 
oc create --save-config -f virtual-service-layer2.yaml 
echo $(oc -n istio-system get route istio-ingressgateway -o jsonpath='{.spec.host}{"/call-layers"}')
cd ..
oc new-app --name="term" --docker-image=quay.io/marrober/devex-terminal-4:full-terminal-1.2
