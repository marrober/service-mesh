oc new-app --image-stream=$1 --name=$2 THIS_LAYER_NAME=$2 VERSION_ID=$3 STUDENT_NAME=$4 PORT=$5 NEXT_LAYER_NAME=$7
oc label dc/$2 app.kubernetes.io/part-of=$6
oc label dc/$2 app.openshift.io/runtime=nodejs
oc expose service $2
