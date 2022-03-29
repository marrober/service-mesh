cd 01-simple-virtual-service
oc delete virtualservice.networking.istio.io --all
oc delete destinationrule.networking.istio.io --all
oc apply -f layer1.yaml
oc apply -f layer2.yaml 
oc delete deployment/layer2-v2
oc apply -f virtual-service-layer1.yaml
cd ../06-retries
oc apply -f destination-rule-layer2.yaml
oc apply -f virtual-service-layer2-initial.yaml
oc create -f layer2-route.yaml
oc get route/layer2 -o jsonpath='{"http://"}{.spec.host}{"/skip-on\n\n"}'
cd ..