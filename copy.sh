oc new-app --image-stream=$1 --name=$2
oc set env dc/$2 THIS_LAYER_NAME=$2 
oc set env dc/$2 NEXT_ROUTES=$5
oc set env dc/$2 VERSION_ID=$3
oc label dc/$2 app.kubernetes.io/part-of=$4 
oc label dc/$2 app.openshift.io/runtime=nodejs
oc expose service $2
