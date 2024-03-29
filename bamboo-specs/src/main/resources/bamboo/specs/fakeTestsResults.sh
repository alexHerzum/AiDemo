#!/usr/bin/env bash
sleep 3
cat << 'EOF' > ${bamboo.build.working.directory}/tests.xml
<testsuite errors="0" failures="0" name="nose2-junit" skips="1" tests="25" time="0.004">
  <testcase classname="pkg1.test.test_things" name="test_gen:1" time="0.000141" ></testcase>
  <testcase classname="pkg1.test.test_things" name="test_gen:2" time="0.000093" ></testcase>
  <testcase classname="pkg1.test.test_things" name="test_gen:3" time="0.000086" ></testcase>
  <testcase classname="pkg1.test.test_things" name="test_gen:4" time="0.000086" ></testcase>
  <testcase classname="pkg1.test.test_things" name="test_gen:5" time="0.000087" ></testcase>
  <testcase classname="pkg1.test.test_things" name="test_gen_nose_style:1" time="0.000085" ></testcase>
  <testcase classname="pkg1.test.test_things" name="test_gen_nose_style:2" time="0.000090" ></testcase>
  <testcase classname="pkg1.test.test_things" name="test_gen_nose_style:3" time="0.000085" ></testcase>
  <testcase classname="pkg1.test.test_things" name="test_gen_nose_style:4" time="0.000087" ></testcase>
  <testcase classname="pkg1.test.test_things" name="test_gen_nose_style:5" time="0.000086" ></testcase>
  <testcase classname="pkg1.test.test_things" name="test_params_func:1" time="0.000093" ></testcase>
  <testcase classname="pkg1.test.test_things" name="test_params_func:2" time="0.000098">
  </testcase>
  <testcase classname="pkg1.test.test_things" name="test_params_func_multi_arg:1" time="0.000094" ></testcase>
  <testcase classname="pkg1.test.test_things" name="test_params_func_multi_arg:2" time="0.000089">
  </testcase>
  <testcase classname="pkg1.test.test_things" name="test_params_func_multi_arg:3" time="0.000096" ></testcase>
  <testcase classname="" name="test_fixt" time="0.000091" ></testcase>
  <testcase classname="" name="test_func" time="0.000084" ></testcase>
  <testcase classname="pkg1.test.test_things.SomeTests" name="test_failed" time="0.000113">
  </testcase>
  <testcase classname="pkg1.test.test_things.SomeTests" name="test_ok" time="0.000093" ></testcase>
  <testcase classname="pkg1.test.test_things.SomeTests" name="test_params_method:1" time="0.000099" ></testcase>
  <testcase classname="pkg1.test.test_things.SomeTests" name="test_params_method:2" time="0.000101">
  </testcase>
  <testcase classname="pkg1.test.test_things.SomeTests" name="test_skippy" time="0.000104">
    <skipped ></skipped>
  </testcase>
  <testcase classname="pkg1.test.test_things.SomeTests" name="test_typeerr" time="0.000096">
  </testcase>
  <testcase classname="pkg1.test.test_things.SomeTests" name="test_gen_method:1" time="0.000094" ></testcase>
  <testcase classname="pkg1.test.test_things.SomeTests" name="test_gen_method:2" time="0.000090">
  </testcase>
</testsuite>
EOF
sleep 5
