cd 04-mtls
oc create --save-config -f peer-authentication-mtls.yaml
oc delete dr --all
oc create --save-config -f destinationrule-mtls.yaml
cd ..
