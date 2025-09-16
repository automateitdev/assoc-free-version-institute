<script setup>
    import { storeToRefs } from "pinia";
    import { useSubjectStore } from "~/stores/subject";
    let arsFlag = ref(null);
    let flag = ref(1);
    const { formData, subjectData, finalFromData , orderFlag } = storeToRefs(useSubjectStore());
    const { fetchGroupByClass } = useSubjectStore();


    const finalFormData = reactive({});

    // function updateFlag($event) {
    //     orderFlag.value = $event.target.value;
    //     console.log(orderFlag.value);
    // }

let mergeCount = ref(0);

function handleCommonTypes($event,sub,flag=null){
   
    let mainSub = formData.value.compulsorySubjects.find(item => item.id === sub.id);
    if (mainSub) {
        let oldSub = formData.value.compulsorySubjects.find(item => item.merge == mainSub.id);
        if (oldSub) {            
            oldSub.merge = 0;
            oldSub.merge_id = 0;
        }
    }

    mainSub[flag] = $event.target.value;

    if(flag === "merge"){
        mainSub.merge_id = ++ mergeCount.value;
        let mergedSub = formData.value.compulsorySubjects.find(i => i.id == $event.target.value);
   
        if($event.target.value == 0){
            mainSub.merge_id = 0;
        }else{
            mergedSub.merge = parseInt(mainSub.id);
            mergedSub.merge_id = mergeCount.value;
        }
    }

}

function handleGroupTypes($event,gp ,sub, flag = null){

    let eid = parseInt($event.target.value);

    let mainSub = formData.value.ars.find(i => i.group === gp.group).subs
        .find((item) =>  item.id == sub.id);

  
    if (mainSub) {
        let oldSub = formData.value.ars.find(i => i.group === gp.group).subs.find(item => item.merge == mainSub.id);
        if (oldSub) {
            oldSub.merge = 0;
            oldSub.merge_id = 0;
        }
    }
    
    mainSub[flag] = eid;

    if (flag == "merge") {
        mainSub.merge_id = ++ mergeCount.value;

      
        let mergedSub = formData.value.ars.find(i => i.group == gp.group).subs
            .find((item) => item.id == eid);
        
     
        if ($event.target.value == 0) {
            mainSub.merge_id = 0;
        } else {
            mergedSub.merge = parseInt(mainSub.id);
            mergedSub.merge_id = mergeCountGroup.value;
        }
}
}


function handleCommonSerial($event,sub){
    let id = $event.target.value;
    formData.value.compulsorySubjects.find(item => item.id === sub.id).serial = id;
}


function handleGroupSerial($event, gp, sub) {
    let id = $event.target.value;

    formData.value.ars.find(i => i.group === gp.group).subs
    .find((item) => item.id == sub.id).serial = id
}

</script>
<template>
    <div>

        <h5 v-if="formData.year">Academic Year :   {{ formData.year?.coresubcategory_details.core_subcategory_name }}</h5>
        <h5 v-if="formData.class">Class :    {{ formData.class?.class_name }}</h5>
      
        <div v-if="formData.compulsorySubjects.length > 0">
           <h6>Common Subjects</h6>
          
           <table class="table table-sm table-bordered text-center">
               <thead class="bg-info">
                   <tr>
                       <th>Subject</th>
                       <th>Type</th>
                       <th>Merge</th>
                       <th>Order</th>
                   </tr>
               </thead>
         
               <tbody>
                   <tr v-for="(sub,index) in formData.compulsorySubjects" :key="sub" class="text-center">
                           <td width="35%" ><input type="hidden" 
                               v-model="finalFromData.common[index]"
                               >
                               <input type="text" readonly  :value="sub.core_subcategory_name" class="form-control">
                           </td>
                           <td width="20%">
                               <select name="" id="" class="form-select form-select-sm" @change="handleCommonTypes($event,sub,'type')">
                                   <option :value="sb.id" v-for="sb in subjectData.commonTypes" :key="sb">
                                       {{ sb.type }}</option>
                               </select>
                           </td>
                           <td width="25%">
                               <select name="" id="" class="form-select form-select-sm"
                               @change="handleCommonTypes($event,sub,'merge')"
                               >
                                   <option value="0" selected>No Merge</option>
                                   <template v-for="s in formData.compulsorySubjects" :key="s">
                                       <template v-if="s.id != sub.id">
                                           <option  :value="s.id"  :selected="sub.id == s.merge">
                                               
                                               {{ s.core_subcategory_name }}
                                           </option>
                                       </template>
                                   </template>
                               </select>
                           </td>
                           <td>
                    
                               <input type="number" class="form-control-sm form-control" min="1" :max="formData.compulsorySubjects.length" step="1" :value="index + 1"
                               @change="handleCommonSerial($event,sub)"
                               >
                            
                           </td>
   
                   </tr>
               </tbody>
           </table>
       </div>
        <hr>

        <div v-if="formData.ars.length > 0">
            <h6>Group wise Subjects</h6>
            <ul style="list-style: none; padding: 0;">
              <li v-for="(gp) in formData.ars" :key="gp">
                  <h6>{{ gp.info.core_subcategory_name }}</h6>
                    <table class="table table-sm table-bordered text-center">
                  <thead class="bg-info">
                      <tr>
                          <th>Subject</th>
                          <th>Type</th>
                          <th>Merge</th>
                          <th>Order</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="(sub, index) in gp.subs" :key="sub" class="text-center ">
                              <td width="35%" class="text-capitalize"><input type="text" readonly  :value="sub.core_subcategory_name" class="form-control"></td>
                              <td width="20%">
                                  <select name="" id="" class="form-select form-select-sm"
                                   @change="handleGroupTypes($event, gp,sub, 'type')"
                                  >
                                      <option :value="sb.id" v-for="sb in subjectData.groupTypes" :key="sb" class="text-capitalize">
                                          {{ sb.type }}</option>
                                  </select>
                              </td>
                              <td width="25%">
                                  <select name="" id="" class="form-select form-select-sm"
                                   @change="handleGroupTypes($event, gp, sub, 'merge')"
                                  >
                                      <option value="0" selected>No Merge</option>
                                      <template v-for="s in gp.subs" :key="s">
                                          <template  v-if="s.id != sub.id"> 
                                              <option :value="s.id" :selected="sub.id == s.merge">
                                                  {{ s.core_subcategory_name }}
                                              </option>
                                          </template>
                                      </template>
                                  </select>
                              </td>
                              <td>
                        
                                  <input type="number" class="form-control-sm form-control" min="0"   step="1" :value="orderFlag + index + 1" @change="handleGroupSerial($event,gp,sub)">
                              </td>
                      </tr>
                  </tbody>
              </table>
              </li>
            </ul>
        </div>

    </div>
</template>

<style lang="scss" scoped>

</style>