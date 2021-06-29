export GATEWAY=$(oc -n istio-system get route istio-ingressgateway -o jsonpath='{.spec.host}{"/call-layers-sleep"}')
for i in {1..100}; do curl $GATEWAY:900; echo "";done