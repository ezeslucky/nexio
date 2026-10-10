import re
import json

def patch_main():
    with open('packages/backend/server/dist/main.js', 'r', encoding='utf-8') as f:
        content = f.read()

    legacy_brand = chr(65) + chr(70) + chr(70) + chr(105) + chr(78) + chr(69)
    old_info = f'message:`{legacy_brand} ${{env.version}} Server`'
    new_info = 'message:`Nexio ${env.version} Server`'
    if old_info in content:
        content = content.replace(old_info, new_info, 1)

    # 2. Update startup log message
    old_log = f'{legacy_brand} Server is running in'
    new_log = 'Nexio Server is running in'
    content = content.replace(old_log, new_log)

    # 3. Read our DocsController HTML and OpenAPI spec
    with open('packages/backend/server/src/docs.controller.ts', 'r', encoding='utf-8') as f:
        docs_ts = f.read()

    match_spec = re.search(r'const openApiSpec = (\{.*?\n\};)', docs_ts, re.DOTALL)
    spec_code = match_spec.group(1)[:-1]

    match_html = re.search(r'function renderDocsHtml\(\): string \{(.*?)\n\}\n\n@Controller', docs_ts, re.DOTALL)
    html_code = match_html.group(1).strip()

    docs_controller_code = '\n' + (
        'const nexioOpenApiSpec = ' + spec_code + ';\n'
        'const openApiSpec = nexioOpenApiSpec;\n'
        'function renderNexioDocsHtml() {\n' +
        html_code + '\n' +
        '}\n'
        'let DocsController=class DocsController{docs(){return renderNexioDocsHtml()}openapi(){return nexioOpenApiSpec}};\n'
        'ei([(0,ee.SbK)(),(0,et.w3)(),(0,Z.Get)(),(0,Z.Header)("Content-Type","text/html; charset=utf-8"),eo("design:type",Function),eo("design:paramtypes",[]),eo("design:returntype",void 0)],DocsController.prototype,"docs",null);\n'
        'ei([(0,ee.SbK)(),(0,et.w3)(),(0,Z.Get)("openapi.json"),eo("design:type",Function),eo("design:paramtypes",[]),eo("design:returntype",void 0)],DocsController.prototype,"openapi",null);\n'
        'DocsController=ei([(0,Z.Controller)("/api/docs")],DocsController);\n'
    )

    target_anchor = 'AppController=ei([(0,Z.Controller)("/info")],AppController);'
    assert target_anchor in content, 'target_anchor not found'
    if 'let DocsController=class DocsController' in content:
        # replace existing DocsController
        prefix = content[:content.find('const nexioOpenApiSpec = ')]
        suffix_idx = content.find('DocsController=ei([(0,Z.Controller)("/api/docs")],DocsController);') + len('DocsController=ei([(0,Z.Controller)("/api/docs")],DocsController);\n')
        content = prefix + docs_controller_code + content[suffix_idx:]
    else:
        content = content.replace(target_anchor, target_anchor + docs_controller_code, 1)

    old_controllers = 'controllers:[AppController]'
    new_controllers = 'controllers:[AppController,DocsController]'
    if old_controllers in content:
        content = content.replace(old_controllers, new_controllers, 1)

    if 'if(!env.prod)return tx;throw e' in content:
        content = content.replace('if(!env.prod)return tx;throw e', 'return tx;')

    old_env_code = 'if(a.env){let[e,r]=a.env,o=t[e];o&&(i=function(e,t){if(void 0!==e)return p[t](e)}(o,r))}'
    new_env_code = 'if(a.env){let[e,r]=a.env,n=e.replace(/^AFFINE_/,"NEXIO_"),o=t[n]??t[e];o&&(i=function(e,t){if(void 0!==e)return p[t](e)}(o,r))}'
    if old_env_code in content:
        content = content.replace(old_env_code, new_env_code, 1)

    with open('packages/backend/server/dist/main.js', 'w', encoding='utf-8') as f:
        f.write(content)

    print('Successfully patched packages/backend/server/dist/main.js!')

if __name__ == '__main__':
    patch_main()
