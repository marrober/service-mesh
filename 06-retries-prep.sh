cd 01-simple-virtual-service
oc delete vs --all
oc delete dr --all
oc apply -f layer1.yaml
oc apply -f layer2.yaml 
oc apply -f virtual-service-layer1.yaml
cd ../06-retries
oc apply -f destination-rule-layer2.yaml
oc apply -f virtual-service-layer2-initial.yaml
oc create -f layer2-route.yaml
oc get route/layer2 -o jsonpath='{"http://"}{.spec.host}{"\n\n"}'
cd ..